/**
 * `.svg` imports are compiled to React components by
 * react-native-svg-transformer at bundle time. Jest doesn't run that
 * transformer, so this stands in — a plain host component that renders
 * nothing but accepts the same props.
 */
const React = require("react");

module.exports = {
  __esModule: true,
  default: (props) => React.createElement("SvgMock", props),
};
