class ThinkingStepModel {
  final String id;
  final String label;
  final String detail;

  const ThinkingStepModel({
    required this.id,
    required this.label,
    required this.detail,
  });
}

class ThinkingEventModel {
  final int durationMs;
  final List<ThinkingStepModel> steps;

  const ThinkingEventModel({
    required this.durationMs,
    required this.steps,
  });
}

class CitationModel {
  final String id;
  final int index;
  final String title;
  final String chunkId;
  final String createdAt;
  final double rrfScore;
  final String snippet;
  final String highlightedTerm;

  const CitationModel({
    required this.id,
    required this.index,
    required this.title,
    required this.chunkId,
    required this.createdAt,
    required this.rrfScore,
    required this.snippet,
    required this.highlightedTerm,
  });
}

enum ApprovalStatus { pending, approved, rejected }

class UiCardModel {
  final String
      cardType; // tool_approval_card | expense_card | schedule_card | analytics_card
  final String cardId;
  final String title;
  final String subtitle;
  final String extraInfo;
  final double amount;
  final ApprovalStatus approvalStatus;

  const UiCardModel({
    required this.cardType,
    required this.cardId,
    required this.title,
    required this.subtitle,
    required this.extraInfo,
    this.amount = 0.0,
    this.approvalStatus = ApprovalStatus.pending,
  });

  UiCardModel copyWith({ApprovalStatus? approvalStatus}) {
    return UiCardModel(
      cardType: cardType,
      cardId: cardId,
      title: title,
      subtitle: subtitle,
      extraInfo: extraInfo,
      amount: amount,
      approvalStatus: approvalStatus ?? this.approvalStatus,
    );
  }
}

class UsageMetricsModel {
  final int ttftMs;
  final int totalTokens;
  final double costUsd;
  final String modelUsed;

  const UsageMetricsModel({
    required this.ttftMs,
    required this.totalTokens,
    required this.costUsd,
    required this.modelUsed,
  });
}

class ChatMessageModel {
  final String id;
  final bool isUser;
  final String text;
  final String? imageName;
  final ThinkingEventModel? thinking;
  final List<CitationModel> citations;
  final UiCardModel? uiCard;
  final UsageMetricsModel? usage;

  const ChatMessageModel({
    required this.id,
    required this.isUser,
    required this.text,
    this.imageName,
    this.thinking,
    this.citations = const [],
    this.uiCard,
    this.usage,
  });

  ChatMessageModel copyWith({
    String? text,
    ThinkingEventModel? thinking,
    List<CitationModel>? citations,
    UiCardModel? uiCard,
    UsageMetricsModel? usage,
  }) {
    return ChatMessageModel(
      id: id,
      isUser: isUser,
      text: text ?? this.text,
      imageName: imageName,
      thinking: thinking ?? this.thinking,
      citations: citations ?? this.citations,
      uiCard: uiCard ?? this.uiCard,
      usage: usage ?? this.usage,
    );
  }
}
