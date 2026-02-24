import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemeIcon from '../../components/ThemeIcon';
import LineWithDiamond from '../../components/LineWithDiamond';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import SmoothBottomModal from '../../components/SmoothBottomModal';
import { THEME_LABELS } from '../../data/prompts';
import { useReflections } from '../../hooks/useReflections';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const CHIP_ACTIVE_COLOR = '#C8B79E';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getWordCount(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Single reflection view: prompt, theme, date, full content. Edit and Delete open modals;
 * delete also pops back to the journey list. Receives the reflection object via route params.
 */
export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { updateReflection, deleteReflection } = useReflections();
  const [reflection, setReflection] = useState(route.params?.reflection ?? null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const editModalRef = useRef(null);
  const [editContent, setEditContent] = useState(reflection?.content ?? '');

  const wordCount = useMemo(() => getWordCount(editContent), [editContent]);

  if (!reflection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>No reflection selected.</Text>
      </View>
    );
  }

  function openEdit() {
    setEditContent(reflection.content);
    setEditModalVisible(true);
  }

  function closeEdit() {
    editModalRef.current?.requestClose();
  }

  async function handleSaveEdit() {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    const updated = {
      ...reflection,
      content: trimmed,
      wordCount: getWordCount(trimmed),
    };
    await updateReflection(updated);
    setReflection(updated);
    closeEdit();
  }

  function handleDelete() {
    Alert.alert(
      'Delete reflection',
      'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteReflection(reflection.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <SubtlePatternBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 0, paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.topSection,
            { paddingTop: insets.top + 6, width: screenWidth, backgroundColor: colors.surface },
            isDark && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
          ]}
        >
          <Text style={[styles.heading, { color: colors.text }]}>Reflection</Text>
        </View>
        <View style={[styles.lineOnEdge, { width: screenWidth }]}>
          <LineWithDiamond flush diamondColor={colors.accent} />
        </View>
        <View style={styles.paddedContent}>
          {reflection.prompt ? (
            <Text style={[styles.question, { color: colors.text }]}>{reflection.prompt}</Text>
          ) : null}
          <View style={[styles.meta, { borderBottomColor: colors.border }]}>
            <View style={styles.themeRow}>
              <ThemeIcon theme={reflection.theme} size={18} color={colors.accent} />
              <Text style={[styles.themeLabel, { color: colors.accent }]}>{THEME_LABELS[reflection.theme] || reflection.theme}</Text>
            </View>
            <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(reflection.date)}</Text>
          </View>
          <Text style={[styles.body, { color: colors.text }]}>{reflection.content}</Text>
        </View>
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[
            styles.backButton,
            { backgroundColor: colors.surfaceSecondary },
            isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </Pressable>
        <Pressable
          style={[
            styles.editButton,
            isDark && { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
          ]}
          onPress={openEdit}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.text} />
          <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.deleteButton, { backgroundColor: colors.danger }]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={[styles.deleteButtonText, { color: '#FFF' }]}>Delete</Text>
        </Pressable>
      </View>

      <SmoothBottomModal
        ref={editModalRef}
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit reflection</Text>
        {reflection.prompt ? (
          <Text style={[styles.modalQuestion, { color: colors.text }]} numberOfLines={2}>
            {reflection.prompt}
          </Text>
        ) : null}
        <TextInput
          style={[styles.modalInput, { color: colors.text, borderBottomColor: colors.border }]}
          placeholder="Your reflection..."
          placeholderTextColor={colors.textMuted}
          value={editContent}
          onChangeText={setEditContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />
        <Text style={[styles.modalWordCount, { color: colors.textMuted }]}>{wordCount} words</Text>
        <View style={styles.modalActions}>
          <Pressable
            style={[
              styles.modalCancelButton,
              { borderColor: colors.border },
              isDark && { backgroundColor: colors.surfaceSecondary, borderColor: 'rgba(255,255,255,0.1)' },
            ]}
            onPress={closeEdit}
          >
            <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.modalSaveButton,
              !editContent.trim() && styles.modalSaveButtonDisabled,
              isDark && { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
            ]}
            onPress={handleSaveEdit}
            disabled={!editContent.trim()}
          >
            <Text style={[styles.modalSaveText, { color: colors.text }]}>Save</Text>
          </Pressable>
        </View>
      </SmoothBottomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4EFE7',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EFE7',
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -24,
    paddingBottom: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  lineOnEdge: {
    marginHorizontal: -24,
    marginTop: -4,
    zIndex: 1,
  },
  paddedContent: {
    paddingTop: 20,
  },
  question: {
    fontSize: 22,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 30,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeLabel: {
    fontSize: 18,
    color: CHIP_ACTIVE_COLOR,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  date: {
    fontSize: 16,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
  },
  body: {
    fontSize: 18,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 30,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#F4EFE7',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: CHIP_ACTIVE_COLOR,
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 18,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#C44B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#8B4545',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  modalTitle: {
    fontSize: 24,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginBottom: 12,
  },
  modalQuestion: {
    fontSize: 19,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 160,
    fontSize: 18,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 30,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  modalWordCount: {
    fontSize: 15,
    color: '#8A8580',
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalCancelText: {
    fontSize: 19,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: CHIP_ACTIVE_COLOR,
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 19,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  subtitle: {
    fontSize: 18,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
  },
});
