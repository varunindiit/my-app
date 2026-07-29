/* eslint-env jest */

/**
 * Hand-rolled Reanimated mock.
 *
 * Reanimated 4 delegates to `react-native-worklets`, and its bundled
 * `react-native-reanimated/mock` still imports the real entry point — which
 * throws "Native part of Worklets doesn't seem to be initialized" under Jest.
 * Mocking at this level keeps animated components renderable in tests without
 * pulling in any native module.
 *
 * Animations resolve instantly: `withTiming(x)` returns `x`. Tests assert on
 * final state, which is what matters for behaviour.
 */
const React = require("react");
const { View, Text, ScrollView, Image, FlatList } = require("react-native");

const identity = (value) => value;

const useSharedValue = (initial) => {
  const ref = React.useRef({ value: initial });
  if (!ref.current.get) {
    ref.current.get = () => ref.current.value;
    ref.current.set = (next) => {
      ref.current.value = typeof next === "function" ? next(ref.current.value) : next;
    };
  }
  return ref.current;
};

const useAnimatedStyle = (factory) => {
  try {
    return factory() ?? {};
  } catch {
    // A style factory that reads a value the mock doesn't model shouldn't fail
    // the whole render.
    return {};
  }
};

const createAnimatedComponent = (Component) =>
  React.forwardRef((props, ref) => React.createElement(Component, { ...props, ref }));

const entering = {
  duration: () => entering,
  delay: () => entering,
  springify: () => entering,
  build: () => () => ({ initialValues: {}, animations: {} }),
};

const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,

  useSharedValue,
  useAnimatedStyle,
  useDerivedValue: (factory) => ({ value: factory(), get: factory, set: () => {} }),
  useAnimatedRef: () => React.createRef(),
  useAnimatedScrollHandler: () => () => {},
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,

  withTiming: identity,
  withSpring: identity,
  withDelay: (_delay, value) => value,
  withSequence: (...values) => values[values.length - 1],
  withRepeat: identity,
  cancelAnimation: () => {},
  interpolate: (value) => value,
  Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },

  Easing: new Proxy(
    {},
    {
      get: () => {
        const fn = (t) => t;
        return new Proxy(fn, { get: () => fn, apply: () => fn });
      },
    },
  ),

  FadeIn: entering,
  FadeOut: entering,
  SlideInDown: entering,
  SlideOutDown: entering,
  LinearTransition: entering,
};
