// Mock file object
const createMockFile = (name, asyncMock) => ({
  name,
  async: asyncMock,
});

// Mock JSZip class - using function to avoid CommonJS issues
const MockJSZip = function () {
  const filesMap = new Map();

  const instance = {
    // Property to expose file names for Object.keys(zip.files) in analyzeZipStructure
    get files() {
      const filesObj = {};
      for (const [name] of filesMap.entries()) {
        filesObj[name] = { name };
      }
      return filesObj;
    },

    file: function (pattern) {
      if (pattern instanceof RegExp) {
        const matchingFiles = [];
        for (const [name, file] of filesMap.entries()) {
          if (pattern.test(name)) {
            matchingFiles.push(createMockFile(name, file.async));
          }
        }
        return matchingFiles;
      }

      const file = filesMap.get(pattern);
      return file ? [createMockFile(pattern, file.async)] : [];
    },

    loadAsync: function () {
      return Promise.resolve(instance);
    },

    // Helper method to add files to the mock
    _addFile: function (name, asyncMock) {
      filesMap.set(name, { async: asyncMock });
    },
  };

  return instance;
};

// Export for CommonJS
module.exports = { MockJSZip };
module.exports.default = MockJSZip;
