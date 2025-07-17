  import React from 'react';
  import Svg, { G, Path } from 'react-native-svg';

  export default function LinkedinWhiteIcon({ size = 22 }) {
    return (
      <Svg width={size} height={size} viewBox="0 0 36 32" fill="none">
        <G>
          <Path d="M29 27h-4.2v-6.2c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V27H17V14.5h4.1v1.7c.5-.8 1.3-2 3.2-2 2.3 0 4 1.5 4 4.7V27zM10.5 12.8c-1.3 0-2.1-.9-2.1-2 0-1.1.8-2 2.1-2s2.1.9 2.1 2c0 1.1-.8 2-2.1 2zm-2.1 14.2h4.2V14.5H8.4V27z" fill="#0077b5"/>
        </G>
      </Svg>
    );
  } 