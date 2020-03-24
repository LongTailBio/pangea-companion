class UnknownContribModuleError extends Error {
  constructor(moduleName) {
    super(`Unknown contrib module ${moduleName}.`);
    this.moduleName = moduleName;
    this.name = 'UnknownContribModuleError';
  }
}

module.exports = {
  UnknownContribModuleError,
};
