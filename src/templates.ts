import {
  type GetTemplatesRequest,
  SubmitTemplateVersionRequest,
  Template,
  Template_TemplateType,
  TemplateMessage as ProtoTemplateMessage,
  TemplateVersion,
} from './v1/gen/baserun.js';
import { Baserun } from './baserun.js';
import getDebug from 'debug';
import { FormattedString } from './utils/formattedString.js';
import { createHash } from 'node:crypto';

const debug = getDebug('baserun:templates');

type roleType = 'user' | 'system' | 'assistant';

export interface FormattedTemplateMeta {
  templateId: string;
  args: Record<string, any>;
}

export interface TemplateMessage {
  content: string;
  role: roleType;
}

export interface TemplateMessageWithMetadata extends TemplateMessage {
  // I don't really like this extra param as we're required to handle it later, we can't just
  //  leave it be...but that's the best thing I came up with
  baserunFormatMetadata?: FormattedTemplateMeta;
}

// TODO: in python sdk there's some kind of caching functionality with cache living for some period of time for this
export function getTemplates(
  environment: string = Baserun.environment,
): Promise<Map<string, Template>> {
  const request: GetTemplatesRequest = { environment };
  debug('fetching templates');
  return new Promise((resolve) => {
    Baserun.submissionService.getTemplates(
      request,
      (error, value) => {
        debug('fetching template done');
        if (error) {
          console.error(
            `Failed to get templates from Baserun. Using ${Baserun.templates.size} cached templates`,
            error,
          );
        } else {
          value?.templates.forEach((template: Template) => {
            Baserun.templates.set(template.name, template);
          });
        }
        resolve(Baserun.templates);
      },
      { deadline: Baserun.grpcDeadline },
    );
  });
}

export function getTemplate(name: string): Promise<Template | null> {
  debug('getting single tamplate');
  return getTemplates().then((templates) => {
    const template = templates.get(name);
    if (!template) {
      console.warn(
        `Attempted to get template ${name} but no template with that name exists`,
      );
      return null;
    }
    return template;
  });
}

function getTemplateTypeEnum(templateType: string = ''): Template_TemplateType {
  if (
    templateType === Template_TemplateType[Template_TemplateType.JINJA2] ||
    templateType.toLowerCase().startsWith('jinja')
  ) {
    return Template_TemplateType.JINJA2;
  }
  return Template_TemplateType.FORMATTED_STRING;
}

export function applyTemplate(
  templateMessages: TemplateMessage[],
  parameters: Record<string, any>,
  templateType: Template_TemplateType,
) {
  const formattedMessages: TemplateMessage[] = [];
  for (const templateMessage of templateMessages) {
    if (templateType !== Template_TemplateType.FORMATTED_STRING) {
      console.warn(
        'all templates are treated as formatted string template. called applyTemplate with type',
        templateType,
      );
    }
    const formattedContent = new FormattedString(
      templateMessage.content,
    ).format(parameters);
    formattedMessages.push({ ...templateMessage, content: formattedContent });
  }

  // TODO: in python sdk there's rather weird mechanism to cache formatted messages and then later match those against
  //  responses from llm provider and based on that put some value in templateId property of a Span
  return formattedMessages;
}

export function formatPrompt(
  templateMessages: TemplateMessage[],
  parameters: Record<string, any>,
  templateType?: string,
) {
  const templateTypeEnum = getTemplateTypeEnum(templateType);
  return applyTemplate(templateMessages, parameters, templateTypeEnum);
}

export function formatPromptFromTemplate(
  template: Template,
  parameters: Record<string, any>,
) {
  const templateMessages =
    // FIXME: using latest template version instead of active version because backend never returns any
    // TODO: maybe order messages by `orderIndex`? I'm guessing that maybe the order in which you get these is not
    //  deterministic and that is what it's for. but python sdk doesn't do that...soo maybe
    //  `orderIndex` actually serves no purpose?
    template.templateVersions[
      template.templateVersions.length - 1
    ]?.templateMessages.map((v) => {
      if (v.role != 'user' && v.role != 'system' && v.role != 'assistant') {
        throw new Error(
          'only `user`, `system` and `assistant` template messages are currently supported in the js sdk',
        );
      }
      return {
        role: v.role as roleType,
        content: v.message,
        baserunFormatMetadata: {
          templateId: template.id,
          args: parameters,
        },
      };
    }) ?? [];
  return applyTemplate(templateMessages, parameters, template.templateType);
}

export async function formatPromptFromTemplateName(
  templateName: string,
  parameters: Record<string, any>,
) {
  const template = await getTemplate(templateName);
  if (!template) {
    return [];
  }
  return formatPromptFromTemplate(template, parameters);
}

function constructTemplateVersion(
  templateMessages: TemplateMessage[],
  templateName?: string,
  templateTag: string = '',
  templateType: Template_TemplateType = Template_TemplateType.FORMATTED_STRING,
): TemplateVersion {
  if (!templateName) {
    templateName = createHash('sha256')
      .update(templateMessages.map((v) => v.content).join(''))
      .digest('hex');
  }
  // ids = "" because protobuf schema doesn't have these marked as optional.
  // but the backend code is written in such a way that this should work
  // TODO: consider how to do it better, perhaps think if we can change protobuf schema to allow optionals
  const template: Template = {
    id: '',
    templateVersions: [],
    name: templateName,
    templateType: templateType,
  };
  const constructedTemplateMessages = templateMessages.map(
    (v, i) =>
      ({
        role: v.role,
        message: v.content,
        orderIndex: i,
      } as ProtoTemplateMessage),
  );
  return {
    id: '',
    template: template,
    templateMessages: constructedTemplateMessages,
    tag: templateTag,
  };
}

export function registerTemplate(
  templateMessages: TemplateMessage[],
  templateName?: string,
  templateTag?: string,
  templateType: Template_TemplateType = Template_TemplateType.FORMATTED_STRING,
) {
  // TODO: make it return a template. unlike the equivalent function in the python sdk I won't return anything here.
  //  thread:
  //  https://flyps-io.slack.com/archives/C06CGG2JQMV/p1708018108110839?thread_ts=1708016640.181699&cid=C06CGG2JQMV
  const version = constructTemplateVersion(
    templateMessages,
    templateName,
    templateTag,
    templateType,
  );
  const request: SubmitTemplateVersionRequest = {
    templateVersion: version,
    environment: Baserun.environment,
  };
  debug('submitting template version');
  return new Promise<void>((resolve, reject) => {
    Baserun.submissionService.submitTemplateVersion(
      request,
      (error) => {
        // TODO: I know for the fact that backend might actually fail to create a template version and still give you
        //  a non-error response, but with message property set to "TemplateVersion could not be created".
        //  consider doing something in a case like that.
        debug('submitting template version done');
        if (error) {
          console.error('Failed to submit template version', error);
          reject(error);
        } else {
          // not putting the template in the Baserun.templates for the same reasons why I'm not returning it
          resolve();
        }
      },
      { deadline: Baserun.grpcDeadline },
    );
  });
}
