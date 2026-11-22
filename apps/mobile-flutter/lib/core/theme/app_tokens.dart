import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color bgPrimary = Color(0xFF0B0F17);
  static const Color bgSurface = Color(0xFF161C28);
  static const Color bgElevated = Color(0xFF1E2638);
  static const Color borderSubtle = Color(0xFF2A344B);

  static const Color accentPrimary = Color(0xFF6366F1);
  static const Color accentCyan = Color(0xFF06B6D4);

  static const Color statusSuccess = Color(0xFF10B981);
  static const Color statusWarning = Color(0xFFF59E0B);
  static const Color statusError = Color(0xFFEF4444);

  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);
  static const Color white = Color(0xFFFFFFFF);

  static const Color cyanTint = Color(0x2E06B6D4);
  static const Color warningTint = Color(0x29F59E0B);
  static const Color successTint = Color(0x2910B981);
  static const Color errorTint = Color(0x29EF4444);
  static const Color darkOverlay = Color(0x38000000);
}

class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
}

class AppRadius {
  AppRadius._();

  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double full = 999.0;
}

class AppTypography {
  AppTypography._();

  static const TextStyle headline = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static const TextStyle title = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  static const TextStyle body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static const TextStyle bodySecondary = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.45,
  );

  static const TextStyle monoCaption = TextStyle(
    fontSize: 12,
    fontFamily: 'monospace',
    color: AppColors.textSecondary,
    height: 1.4,
  );
}
