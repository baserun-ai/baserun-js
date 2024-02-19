import { beforeEach, describe, expect, test, vi } from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import { Template, Template_TemplateType } from '../v1/gen/baserun.js';
import { randomUUID } from 'node:crypto';
import { TemplateMessage } from '../templates.js';

// TODO: these tests would ideally be much more extensive
describe('openai', () => {
  const envName = 'some_random_name';
  vi.stubEnv('ENVIRONMENT', envName);
  baserun.init();
  const submitTemplateVersionSpy = vi.spyOn(
    Baserun.submissionService,
    'submitTemplateVersion',
  );

  beforeEach(() => {
    Baserun.templates = new Map();
    submitTemplateVersionSpy.mockClear();
  });

  const submittedMessages: TemplateMessage[] = [
    { role: 'system', content: 'hi {name1}' },
    { role: 'user', content: 'hello {name2}' },
  ];
  const expectedSha =
    '1743947f10d2c2c60ef6bbc85a7bf56ef83e422bfad2357faa78c8fc3ed607c1';
  const expectedProtoTemplateMessages = [
    { role: 'system', message: 'hi {name1}', orderIndex: 0 },
    { role: 'user', message: 'hello {name2}', orderIndex: 1 },
  ];
  const name1 = 'Grzegorz';
  const name2 = 'Gregory';
  const formatParameters = { name1: name1, name2: name2 };
  const expectedFormattedMessages = [
    { role: 'system', content: `hi ${name1}` },
    { role: 'user', content: `hello ${name2}` },
  ];

  test('register template with defaults', async () => {
    await baserun.registerTemplate(submittedMessages);

    expect(submitTemplateVersionSpy.mock.calls.length).toEqual(1);
    const submittedObj = submitTemplateVersionSpy.mock.calls[0][0];
    expect(submittedObj.environment).toBe(envName);
    expect(submittedObj.templateVersion).toBeDefined();
    const templateVersion = submittedObj.templateVersion!;
    expect(templateVersion.tag).toBe('');
    expect(templateVersion.id).toBe('');
    expect(templateVersion.templateString).toBeUndefined();
    expect(templateVersion.parameterDefinition).toBeUndefined();
    expect(templateVersion.templateMessages).toMatchObject(
      expectedProtoTemplateMessages,
    );
    expect(templateVersion.template).toBeDefined();
    const template = templateVersion.template!;
    expect(template.name).toEqual(expectedSha);
    expect(template.id).toEqual('');
    expect(template.templateType).toEqual(
      Template_TemplateType.FORMATTED_STRING,
    );
    expect(template.activeVersion).toBeUndefined();
  });

  test('register template with optional params', async () => {
    const templateName = randomUUID();
    const templateTag = randomUUID();
    const templateType = Template_TemplateType.JINJA2;
    await baserun.registerTemplate(
      submittedMessages,
      templateName,
      templateTag,
      templateType,
    );

    expect(submitTemplateVersionSpy.mock.calls.length).toEqual(1);
    const submittedObj = submitTemplateVersionSpy.mock.calls[0][0];
    expect(submittedObj.environment).toBe(envName);
    expect(submittedObj.templateVersion).toBeDefined();
    const templateVersion = submittedObj.templateVersion!;
    expect(templateVersion.tag).toBe(templateTag);
    expect(templateVersion.id).toBe('');
    expect(templateVersion.templateString).toBeUndefined();
    expect(templateVersion.parameterDefinition).toBeUndefined();
    expect(templateVersion.templateMessages).toMatchObject(
      expectedProtoTemplateMessages,
    );
    expect(templateVersion.template).toBeDefined();
    const template = templateVersion.template!;
    expect(template.name).toEqual(templateName);
    expect(template.id).toEqual('');
    expect(template.templateType).toEqual(templateType);
    expect(template.activeVersion).toBeUndefined();
  });

  test('get template', async () => {
    const templateName = randomUUID();
    const templateTag = randomUUID();
    const templateType = Template_TemplateType.JINJA2;
    await baserun.registerTemplate(
      submittedMessages,
      templateName,
      templateTag,
      templateType,
    );

    const foundTemplate = await baserun.getTemplate(templateName);
    expect(foundTemplate).toBeDefined();
    const reallyFoundTemplate = foundTemplate!;
    expect(reallyFoundTemplate.name).toEqual(templateName);
    expect(reallyFoundTemplate.templateType).toEqual(templateType);
    expect(reallyFoundTemplate.templateVersions.length).toEqual(1);
    const templateVersion = reallyFoundTemplate.templateVersions[0];
    expect(templateVersion.tag).toEqual(templateTag);
    expect(templateVersion.templateMessages).toMatchObject(
      expectedProtoTemplateMessages,
    );
  });

  test('format prompt', async () => {
    const prompt = baserun.formatPrompt(submittedMessages, formatParameters);
    expect(prompt).toMatchObject(expectedFormattedMessages);
  });

  test('format prompt from template', async () => {
    const template: Template = {
      id: '',
      name: 'asdf',
      templateType: Template_TemplateType.FORMATTED_STRING,
      templateVersions: [
        {
          id: '',
          tag: '',
          templateMessages: expectedProtoTemplateMessages.map((v) => ({
            id: '',
            ...v,
          })),
        },
      ],
    };
    const prompt = baserun.formatPromptFromTemplate(template, formatParameters);
    expect(prompt).toMatchObject(expectedFormattedMessages);
  });

  test('format prompt template name', async () => {
    const templateName = randomUUID();
    await baserun.registerTemplate(submittedMessages, templateName);
    const prompt = await baserun.formatPromptFromTemplateName(
      templateName,
      formatParameters,
    );
    expect(prompt).toMatchObject(expectedFormattedMessages);
  });
});
