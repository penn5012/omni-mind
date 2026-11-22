import 'package:flutter/material.dart';
import 'core/l10n/app_strings.dart';
import 'core/theme/app_tokens.dart';
import 'presentation/pages/omni_workbench_page.dart';

void main() {
  runApp(const OmniMindApp());
}

class OmniMindApp extends StatelessWidget {
  const OmniMindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appTitle,
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        splashFactory: InkRipple.splashFactory,
        scaffoldBackgroundColor: AppColors.bgPrimary,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.accentPrimary,
          secondary: AppColors.accentCyan,
          surface: AppColors.bgSurface,
        ),
      ),
      home: const OmniWorkbenchPage(),
    );
  }
}
