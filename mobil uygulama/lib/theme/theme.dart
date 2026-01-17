import 'package:flutter/material.dart';

const lightColorScheme = ColorScheme(
  brightness: Brightness.light,
  primary: Color(0xFF1976D2),
  onPrimary: Colors.white,
  secondary: Color(0xFF03A9F4),
  onSecondary: Colors.white,
  error: Color(0xFFD32F2F),
  onError: Colors.white,
  background: Color(0xFFF5F5F5),
  onBackground: Colors.black,
  surface: Colors.white,
  onSurface: Colors.black,
);

const darkColorScheme = ColorScheme(
  brightness: Brightness.dark,
  primary: Color(0xFF90CAF9),
  onPrimary: Colors.black,
  secondary: Color(0xFF81D4FA),
  onSecondary: Colors.black,
  error: Color(0xFFEF9A9A),
  onError: Colors.black,
  background: Color(0xFF303030),
  onBackground: Colors.white,
  surface: Color(0xFF424242),
  onSurface: Colors.white,
);

ThemeData lightMode = ThemeData(
  useMaterial3: true,
  brightness: Brightness.light,
  colorScheme: lightColorScheme,
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ButtonStyle(
      backgroundColor: MaterialStateProperty.all(Color.fromARGB(255, 11, 71, 12)),
      foregroundColor: MaterialStateProperty.all(lightColorScheme.onPrimary),
    ),
  ),
  scaffoldBackgroundColor: lightColorScheme.background,
  appBarTheme: AppBarTheme(
    backgroundColor: lightColorScheme.primary,
    foregroundColor: lightColorScheme.onPrimary,
  ),
);