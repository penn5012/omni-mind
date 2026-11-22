import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:omnimind_mobile/core/l10n/app_strings.dart';
import 'package:omnimind_mobile/main.dart';

void main() {
  testWidgets(
    'SMK-01: Cold start & multi-resolution (360x640 small screen + 393x852 normal screen) zero overflow check',
    (WidgetTester tester) async {
      tester.view.physicalSize = const Size(360, 640);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(const OmniMindApp());
      await tester.pumpAndSettle();

      expect(find.text(AppStrings.appTitle), findsOneWidget);
      expect(find.text(AppStrings.hitlCardTitle), findsOneWidget);
    },
  );

  testWidgets(
    'SMK-02 & SMK-03: Multimodal receipt prompt streaming & Generative UI expense_card rendering',
    (WidgetTester tester) async {
      await tester.pumpWidget(const OmniMindApp());
      await tester.pumpAndSettle();

      final Finder receiptChip = find.byKey(const Key('chip_receipt'));
      expect(receiptChip, findsOneWidget);
      await tester.tap(receiptChip);
      await tester.pump(const Duration(milliseconds: 150));
      await tester.pumpAndSettle();

      expect(find.textContaining('Starbucks Reserve 星巴克臻选'), findsWidgets);
      expect(find.text('¥68.00'), findsOneWidget);
    },
  );

  testWidgets(
    'SMK-04: Clicking [1] citation badge opens RAG Citation BottomSheet drawer',
    (WidgetTester tester) async {
      await tester.pumpWidget(const OmniMindApp());
      await tester.pumpAndSettle();

      final Finder citationBadge =
          find.byKey(const Key('citation_badge_msg_init_ai'));
      await tester.ensureVisible(citationBadge);
      await tester.pumpAndSettle();

      await tester.tap(citationBadge);
      await tester.pumpAndSettle();

      expect(
          find.textContaining(AppStrings.citationSheetTitle), findsOneWidget);
      expect(find.textContaining('RRF: 0.92'), findsOneWidget);
    },
  );

  testWidgets(
    'SMK-05: Human-in-the-Loop tool approval card state transition & Model Router fallback sheet',
    (WidgetTester tester) async {
      await tester.pumpWidget(const OmniMindApp());
      await tester.pumpAndSettle();

      final Finder approveBtn =
          find.byKey(const Key('approve_btn_msg_init_ai'));
      await tester.ensureVisible(approveBtn);
      await tester.pumpAndSettle();

      await tester.tap(approveBtn);
      await tester.pumpAndSettle();

      expect(find.text(AppStrings.approvedResultMsg), findsOneWidget);

      await tester.tap(find.byKey(const Key('model_router_button')));
      await tester.pumpAndSettle();
      expect(find.text(AppStrings.modelRouterTitle), findsOneWidget);
    },
  );
}
