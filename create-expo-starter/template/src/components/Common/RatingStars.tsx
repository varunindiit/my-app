import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { moderateScale } from "react-native-size-matters";
import { THEME } from "../../theme";

/** Five-pointed star outline path on a 24x24 grid. */
const STAR_PATH =
  "M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.62L12 17.77 6.05 20.8l1.14-6.62L2.38 9.49l6.65-.97L12 2.5Z";

interface StarProps {
  filled: boolean;
  size: number;
  color: string;
  emptyColor: string;
  disabled: boolean;
  onPress: () => void;
}

/** One tappable star that "pops" with a spring when selected. */
const Star: React.FC<StarProps> = ({
  filled,
  size,
  color,
  emptyColor,
  disabled,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.set(
      withSequence(
        withSpring(1.3, { stiffness: 320, damping: 12 }),
        withSpring(1, { stiffness: 160, damping: 14 }),
      ),
    );
    onPress();
  };

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <TouchableWithoutFeedback disabled={disabled} onPress={handlePress}>
      <Animated.View style={[styles.star, popStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d={STAR_PATH}
            fill={filled ? color : "none"}
            stroke={filled ? color : emptyColor}
            strokeWidth={filled ? 0 : 1.6}
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

interface RatingStarsProps {
  /** Currently selected rating (0 - `count`). */
  rating: number;
  /** Fired with the new rating (1 - `count`) when a star is tapped. */
  onChange?: (value: number) => void;
  count?: number;
  size?: number;
  /** Fill colour used for selected stars. */
  color?: string;
  /** Outline colour used for unselected stars. */
  emptyColor?: string;
  /** Disables taps without dimming — for read-only display. */
  disabled?: boolean;
}

/**
 * Animated, tappable star rating. Each star "pops" with a spring when selected,
 * keeping the rating interaction smooth and premium. Reusable across the app.
 */
const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onChange,
  count = 5,
  size = moderateScale(34),
  color = THEME.primary,
  emptyColor = THEME.primaryLight,
  disabled,
}) => (
  <View style={styles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        filled={i < rating}
        size={size}
        color={color}
        emptyColor={emptyColor}
        disabled={disabled || !onChange}
        onPress={() => onChange?.(i + 1)}
      />
    ))}
  </View>
);

export default RatingStars;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  star: {
    marginHorizontal: moderateScale(6),
  },
});
