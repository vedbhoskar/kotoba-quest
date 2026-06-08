import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Screen } from "../src/components/Screen";
import { n5Dataset } from "../src/data/n5";
import { styles } from "../src/theme/styles";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(
    () =>
      n5Dataset.chapters
        .flatMap((chapter) => chapter.vocabulary)
        .filter((word) => {
          if (!searchQuery.trim()) {
            return false;
          }
          const query = searchQuery.trim().toLowerCase();
          return (
            word.japanese.includes(searchQuery.trim()) ||
            word.reading.includes(searchQuery.trim()) ||
            word.romaji.toLowerCase().includes(query) ||
            word.meaning.some((meaning) => meaning.toLowerCase().includes(query))
          );
        })
        .slice(0, 20),
    [searchQuery]
  );

  return (
    <Screen>
      <Text style={styles.screenTitle}>Search Vocabulary</Text>
      <Text style={styles.screenBody}>
        Search by Japanese, reading, romaji, or meaning across the full N5 set.
      </Text>
      <TextInput
        placeholder="Try tabemasu, たべます, 食べます, or eat"
        placeholderTextColor="#64748B"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <View style={styles.section}>
        {searchResults.length === 0 ? (
          <Text style={styles.mutedText}>No matches yet. Start typing to search the dataset.</Text>
        ) : (
          searchResults.map((word) => (
            <View key={word.uid} style={styles.listCard}>
              <Text style={styles.listTitle}>{word.japanese}</Text>
              <Text style={styles.listMeta}>
                {word.reading} • {word.romaji} • {word.meaning.join(", ")}
              </Text>
            </View>
          ))
        )}
      </View>
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </Screen>
  );
}
