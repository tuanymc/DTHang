// src/config/antd.config.ts
import { ThemeConfig } from 'antd';
import viVN from 'antd/locale/vi_VN';

export const antdConfig: { theme: ThemeConfig; locale: any } = {
  locale: viVN,
  theme: {
    token: {
      // Font chữ Lexend - optimized for reading
      fontFamily: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      
      // Kích thước font
      fontSize: 14,
      fontSizeLG: 16,
      fontSizeSM: 12,
      fontSizeXL: 20,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,
      
      // Font weight
      fontWeightStrong: 600,
      
      // Line height - Lexend works well with slightly larger line height
      lineHeight: 1.6,
      lineHeightLG: 1.5,
      lineHeightSM: 1.666,
      
      // Màu sắc chữ
      colorText: '#1a202c',
      colorTextSecondary: '#4a5568',
      colorTextTertiary: '#718096',
      colorTextQuaternary: '#a0aec0',
    },
    components: {
      Typography: {
        fontFamily: "'Lexend', sans-serif",
        titleMarginBottom: '0.5em',
        titleMarginTop: '1.2em',
      },
      Button: {
        fontFamily: "'Lexend', sans-serif",
        fontWeight: 500,
        fontSize: 14,
      },
      Input: {
        fontFamily: "'Lexend', sans-serif",
        fontSize: 14,
      },
      Table: {
        fontFamily: "'Lexend', sans-serif",
        fontSize: 14,
      },
      Card: {
        fontFamily: "'Lexend', sans-serif",
      },
      Select: {
        fontFamily: "'Lexend', sans-serif",
      },
      Modal: {
        fontFamily: "'Lexend', sans-serif",
      },
      Form: {
        fontFamily: "'Lexend', sans-serif",
      },
    },
  },
};