import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import useResults from '../hooks/useResults';
import ResultsList from '../components/ResultsList';

export default function SearchScreen() {
  const [searchApi, results, errorMessage] = useResults();
  const [term, setTerm] = useState('');
  //   console.log(results);

  const filterResultsByPrice = (price) => {
    return results.filter((result) => {
      return result.price === price;
    });
  };
  return (
    <View>
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onTermSubmit={() => searchApi(term)}
      />
      {errorMessage ? (
        <Text>{errorMessage}</Text>
      ) : (
        <>
          {results.length == 0 ? (
            <></>
          ) : (
            <>
              <ResultsList
                title="Budget-Friendly Restaurants"
                results={filterResultsByPrice('₺')}
              />
              <ResultsList
                title="Mid-Priced Restaurants"
                results={filterResultsByPrice('₺₺')}
              />
              <ResultsList
                title="Premium Restaurants"
                results={filterResultsByPrice('₺₺₺')}
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
