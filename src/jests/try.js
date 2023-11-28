try {
  const response = await baserun.trace(aiService.getResponse)(
    {
      product,
      shop,
      thread: req.body.thread,
    },
    'trace name',
  ); // <-- here
  logThread(ensureExists(shop.id), req.body.thread.id, [
    ...req.body.thread.messages,
    ...response,
  ]);
  res.json({ messages: response });
} catch (err) {
  next(err);
}
