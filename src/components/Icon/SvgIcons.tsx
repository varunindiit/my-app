import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

/* -------------------------------------------------------- */
/* Navigation / Common                                       */
/* -------------------------------------------------------- */

export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6l-6 6 6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#94A6B1",
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = 22,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const MinusIcon: React.FC<IconProps> = ({
  size = 22,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 16,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#7C7BA4",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#7C7BA4",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1l22 22"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({
  size = 22,
  color = "#22C55E",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={color} />
    <Path
      d="M8.5 12.5l2.4 2.4 4.6-4.6"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* -------------------------------------------------------- */
/* Forms / media / contact                                   */
/* -------------------------------------------------------- */

export const CameraIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.5 4h5l1.5 2.5h3.5A1.5 1.5 0 0 1 21 8v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V8a1.5 1.5 0 0 1 1.5-1.5H8L9.5 4Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={3.5} stroke={color} strokeWidth={1.6} />
  </Svg>
);

export const GalleryIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#FFFFFF",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={4}
      width={18}
      height={16}
      rx={3}
      stroke={color}
      strokeWidth={1.6}
    />
    <Circle cx={9} cy={10} r={1.6} stroke={color} strokeWidth={1.6} />
    <Path
      d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L16 17m-1.5-2.2 1.7-1.7a2 2 0 0 1 2.8 0L21 14.6"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloudUploadIcon: React.FC<IconProps> = ({
  size = 28,
  color = "#E87C3E",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 18a4.5 4.5 0 1 1 .39-8.98A6 6 0 0 1 19.5 11 4 4 0 0 1 18 18.86"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 12v7M9 14.5l3-3 3 3"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#BCA0CB",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.6} />
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.6} />
    <Path
      d="M5.5 19c1.3-3 3.9-4.5 6.5-4.5s5.2 1.5 6.5 4.5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

export const UserOutlineIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#E87C3E",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.7} />
    <Path
      d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#BCA0CB",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.29-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.57 2.79.7A2 2 0 0 1 22 16.92Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PinIcon: React.FC<IconProps> = ({
  size = 14,
  color = "#E87C3E",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={1.7} />
  </Svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({
  size = 18,
  color = "#A294E8",
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M13.3 8.67c0 3.33-2.33 5-5.1 5.96-.14.05-.3.05-.44 0-2.78-.96-5.1-2.63-5.1-5.96V4c0-.37.3-.67.67-.67 1.33 0 3-.8 4.16-1.81.29-.25.72-.25 1.01 0 1.17 1.02 2.83 1.81 4.16 1.81.37 0 .67.3.67.67v4.67"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 8l1.33 1.33L10 6.67"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* -------------------------------------------------------- */
/* Payment brands                                            */
/* -------------------------------------------------------- */

export const MastercardIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 32 22" fill="none">
    <Circle cx={11} cy={11} r={9} fill="#EB001B" />
    <Circle cx={21} cy={11} r={9} fill="#F79E1B" />
    <Path
      d="M16 4.6a8.97 8.97 0 0 1 0 12.8 8.97 8.97 0 0 1 0-12.8Z"
      fill="#FF5F00"
    />
  </Svg>
);

export const VisaIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 32 22" fill="none">
    <Rect x={0} y={0} width={32} height={22} rx={3} fill="#1A1F71" />
    <Path
      d="M12.4 8.4l-1.9 5.5h-1.5l-.93-3.6c-.06-.22-.1-.3-.27-.39-.28-.14-.74-.27-1.14-.36l.04-.15h2.43c.31 0 .59.2.66.55l.5 2.65 1.23-3.2h1.47Zm5.78 3.7c0-1.43-1.98-1.51-1.97-2.15.01-.2.2-.41.61-.46.21-.03.79-.05 1.44.25l.24-1.13c-.35-.13-.81-.25-1.37-.25-1.44 0-2.46.77-2.47 1.86-.01.81.73 1.27 1.28 1.54.57.28.76.45.76.7-.01.38-.45.55-.87.56-.74.01-1.16-.2-1.5-.36l-.26 1.17c.35.16 1 .3 1.66.31 1.54 0 2.55-.76 2.56-1.94Zm3.83 1.8h1.36l-1.18-5.5h-1.25c-.28 0-.52.16-.62.42l-2.21 5.08h1.54l.31-.85h1.88l.17.85Zm-1.63-2.02l.77-2.13.45 2.13h-1.22Zm-6.16-3.48l-1.21 5.5h-1.46l1.21-5.5h1.46Z"
      fill="#FFFFFF"
    />
  </Svg>
);
