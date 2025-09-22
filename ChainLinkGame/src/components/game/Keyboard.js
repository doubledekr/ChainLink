import React from 'react';
import { View } from 'react-native';
import { KeyboardKey } from '../../../CustomUIComponents';
import { KEYBOARD_ROWS } from '../../utils/constants';
import { globalStyles } from '../../styles/globalStyles';

const Keyboard = ({ onKeyPress, keyPressed, keyPressAnim }) => {
  return (
    <View style={globalStyles.keyboard}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={globalStyles.keyboardRow}>
          {rowIndex === 2 && (
            <KeyboardKey
              letter="ENTER"
              onPress={onKeyPress}
              isSpecial={true}
              pressed={keyPressed === 'ENTER'}
              animatedValue={keyPressed === 'ENTER' ? keyPressAnim : null}
            />
          )}
          {row.map((letter) => (
            <KeyboardKey
              key={letter}
              letter={letter}
              onPress={onKeyPress}
              pressed={keyPressed === letter}
              animatedValue={keyPressed === letter ? keyPressAnim : null}
            />
          ))}
          {rowIndex === 2 && (
            <KeyboardKey
              letter="BACKSPACE"
              onPress={onKeyPress}
              isSpecial={true}
              pressed={keyPressed === 'BACKSPACE'}
              animatedValue={keyPressed === 'BACKSPACE' ? keyPressAnim : null}
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default Keyboard;
