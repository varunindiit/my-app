import { render, fireEvent, screen } from "@testing-library/react-native";
import RNButton from "@/components/Button/RNButton";

// Note: `render` is async in @testing-library/react-native v14 — it must be
// awaited, otherwise every query runs against an empty tree.
describe("RNButton", () => {
  it("renders its title and fires onPress", async () => {
    const onPress = jest.fn();
    await render(<RNButton title="Continue" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Continue" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire while loading", async () => {
    const onPress = jest.fn();
    await render(<RNButton title="Save" onPress={onPress} loading />);

    fireEvent.press(screen.getByRole("button", { name: "Save" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not fire when disabled", async () => {
    const onPress = jest.fn();
    await render(<RNButton title="Save" onPress={onPress} disabled />);

    fireEvent.press(screen.getByRole("button", { name: "Save" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("exposes busy and disabled state to assistive technology", async () => {
    await render(<RNButton title="Save" loading />);

    expect(
      screen.getByRole("button", { name: "Save" }).props.accessibilityState,
    ).toMatchObject({ busy: true, disabled: true });
  });

  it("accepts an explicit label for icon-only buttons", async () => {
    await render(<RNButton accessibilityLabel="Close" />);
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });
});
