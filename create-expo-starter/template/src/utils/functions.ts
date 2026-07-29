import { showMessage, MessageType } from "react-native-flash-message";
import { FONTS } from "@/theme";

export const showToast = (
  message: string,
  type: MessageType = "info",
  duration: number = 2000,
) => {
  showMessage({
    message,
    type,
    icon: type,
    floating: true,
    style: { alignItems: "center" },
    duration,
    titleStyle: { fontFamily: FONTS.medium, fontWeight: "500" },
  });
};
