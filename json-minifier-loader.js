module.exports = function (source) {
  const json = JSON.parse(source);
  const minifiedJson = JSON.stringify(json);
  return `export default ${JSON.stringify(minifiedJson)};`;
};
