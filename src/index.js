const factory = require('./factory');

main();

async function main() {
  const f = await factory(process.env);

  try {
    f.app.listen(f.config.app.port, () => {
      f.logger.info(`Express App Listening on Port ${f.config.app.port}`);
    });
  } catch (error) {
    console.error(`Server error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
