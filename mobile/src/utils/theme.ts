export const colors = {
  primary: '#E91E8C',
  primaryLight: '#F8BBD9',
  primaryDark: '#AD1457',
  secondary: '#FFC0CB',
  secondaryLight: '#FFE4E9',
  background: '#FFF5F7',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#F0D4DC',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  white: '#FFFFFF',

  feedingBreastfeeding: '#FFB74D',
  feedingFormula: '#4FC3F7',
  
  appointmentMilkDrop: '#FF69B4',
  appointmentVaccine: '#FF7043',
  appointmentDoctor: '#4FC3F7',
  appointmentDefault: '#81C784',

  urgentBackground: '#FFF0F5',
  urgentText: '#E91E63',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  regular: 'Heebo_400Regular',
  medium: 'Heebo_500Medium',
  semiBold: 'Heebo_600SemiBold',
  bold: 'Heebo_700Bold',
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: fonts.bold,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: fonts.regular,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    fontFamily: fonts.medium,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: fonts.regular,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    fontFamily: fonts.regular,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700' as const,
    fontFamily: fonts.bold,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
};

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

export const iconContainerSizes = {
  sm: 40,
  md: 52,
  lg: 56,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primary: {
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const globalTextStyle = {
  textAlign: 'right' as const,
  fontFamily: fonts.regular,
};
