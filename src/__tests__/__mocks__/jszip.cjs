// Mock file object
const createMockFile = (name, asyncMock) => ({
  name,
  async: asyncMock,
});

// Mock JSZip class - using function to avoid CommonJS issues
const MockJSZip = function () {
  const files = new Map();

  return {
    file: function (pattern) {
      if (pattern instanceof RegExp) {
        const matchingFiles = [];
        for (const [name, file] of files.entries()) {
          if (pattern.test(name)) {
            matchingFiles.push(createMockFile(name, file.async));
          }
        }
        return matchingFiles;
      }

      const file = files.get(pattern);
      return file ? [createMockFile(pattern, file.async)] : [];
    },

    loadAsync: function () {
      return Promise.resolve({
        file: function (pattern) {
          if (pattern instanceof RegExp) {
            const matchingFiles = [];
            for (const [name, file] of files.entries()) {
              if (pattern.test(name)) {
                matchingFiles.push(createMockFile(name, file.async));
              }
            }
            return matchingFiles;
          }

          const file = files.get(pattern);
          return file ? [createMockFile(pattern, file.async)] : [];
        },
      });
    },

    // Helper method to add files to the mock
    _addFile: function (name, asyncMock) {
      files.set(name, { async: asyncMock });
    },
  };
};

// Export for CommonJS
module.exports = { MockJSZip };
module.exports.default = MockJSZip;
