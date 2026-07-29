import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  Avatar,
  BottomSheet,
  BottomSheetAlert,
  Card,
  CenterAlert,
  Checkbox,
  Chip,
  Divider,
  Dropdown,
  EmptyState,
  FAB,
  Loader,
  OtpInput,
  RNButton,
  RNInput,
  RNText,
  RatingStars,
  SegmentedControl,
  StatusBadge,
  Toggle,
  UploadBox,
} from "@/components";
import { SPACING, makeStyles, useTheme } from "@/theme";

/**
 * Living component gallery.
 *
 * Every primitive rendered against the active theme, so you can see the whole
 * design system — including how it behaves in dark mode — without hunting
 * through source files. Delete this route (and its tab in `_layout.tsx`) once
 * your own screens exist; the `--preset minimal` scaffold omits it entirely.
 */
const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <RNText font="semibold" size={13} color={colors.textMuted}>
        {title.toUpperCase()}
      </RNText>
      <Card style={styles.sectionBody}>{children}</Card>
    </View>
  );
};

const DROPDOWN_OPTIONS = [
  { label: "Option one", value: "1" },
  { label: "Option two", value: "2" },
  { label: "Option three", value: "3" },
];

const SEGMENTS = [
  { key: "a", label: "First" },
  { key: "b", label: "Second" },
];

const ComponentGallery = () => {
  const styles = useStyles();

  const [text, setText] = useState("");
  const [otp, setOtp] = useState("");
  const [checked, setChecked] = useState(true);
  const [toggled, setToggled] = useState(true);
  const [rating, setRating] = useState(4);
  const [segment, setSegment] = useState("a");
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [alert, setAlert] = useState(false);
  const [center, setCenter] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <RNText font="bold" size={26}>
        Components
      </RNText>

      <Section title="Buttons">
        <View style={styles.stack}>
          <RNButton title="Primary" />
          <RNButton title="Secondary" variant="secondary" />
          <RNButton title="Outline" variant="outline" />
          <RNButton title="Ghost" variant="ghost" />
          <RNButton title="Danger" variant="danger" />
          <RNButton title="Loading" loading />
          <RNButton title="Disabled" disabled />
        </View>
      </Section>

      <Section title="Inputs">
        <View style={styles.stack}>
          <RNInput label="Label" value={text} onChangeText={setText} placeholder="Type here" />
          <RNInput label="Password" secure placeholder="••••••••" />
          <RNInput label="With error" error="This field is required" />
          <OtpInput value={otp} onChange={setOtp} length={4} />
          <Dropdown
            value={dropdown}
            options={DROPDOWN_OPTIONS}
            onChange={setDropdown}
            placeholder="Pick one"
            title="Choose an option"
          />
        </View>
      </Section>

      <Section title="Controls">
        <View style={styles.row}>
          <Checkbox value={checked} onChange={setChecked} label="Checkbox" />
          <Toggle value={toggled} onChange={setToggled} accessibilityLabel="Demo toggle" />
        </View>
        <SegmentedControl tabs={SEGMENTS} value={segment} onChange={setSegment} />
        <SegmentedControl
          tabs={SEGMENTS}
          value={segment}
          onChange={setSegment}
          variant="underline"
        />
        <RatingStars rating={rating} onChange={setRating} />
      </Section>

      <Section title="Display">
        <View style={styles.row}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" ring />
          <StatusBadge label="Success" tone="success" dot />
          <StatusBadge label="Warning" tone="warning" />
          <StatusBadge label="Danger" tone="danger" />
        </View>
        <View style={styles.row}>
          <Chip label="Outline" />
          <Chip label="Soft" variant="soft" />
          <Chip label="Active" active />
        </View>
        <Divider />
        <UploadBox title="Upload a document" onPress={() => {}} />
        <View style={styles.loaderBox}>
          <Loader size="small" />
        </View>
        <View style={styles.emptyBox}>
          <EmptyState
            title="Nothing here yet"
            description="EmptyState renders a title, description and optional icon."
          />
        </View>
      </Section>

      <Section title="Overlays">
        <View style={styles.stack}>
          <RNButton title="Bottom sheet" variant="outline" onPress={() => setSheet(true)} />
          <RNButton title="Sheet alert" variant="outline" onPress={() => setAlert(true)} />
          <RNButton title="Center alert" variant="outline" onPress={() => setCenter(true)} />
        </View>
      </Section>

      <View style={styles.fabRow}>
        <FAB onPress={() => {}} />
      </View>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)}>
        <RNText font="semibold" size={18}>
          Bottom sheet
        </RNText>
        <RNText size={13} style={styles.sheetBody}>
          Swipe down or tap the backdrop to dismiss.
        </RNText>
      </BottomSheet>

      <BottomSheetAlert
        visible={alert}
        onClose={() => setAlert(false)}
        title="Delete this item?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        destructive
      />

      <CenterAlert
        visible={center}
        onClose={() => setCenter(false)}
        title="Center alert"
        description="A centred modal for confirmations that need focus."
        confirmText="Got it"
        onConfirm={() => setCenter(false)}
      />
    </ScrollView>
  );
};

export default ComponentGallery;

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.hPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.huge * 2,
    gap: SPACING.lg,
  },
  section: { gap: SPACING.sm },
  sectionBody: { gap: SPACING.md },
  stack: { gap: SPACING.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  loaderBox: { height: 48 },
  emptyBox: { height: 160 },
  fabRow: { alignItems: "flex-end" },
  sheetBody: { marginTop: SPACING.sm },
}));
