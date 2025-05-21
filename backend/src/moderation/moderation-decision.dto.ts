export class ModerationDecisionDto {
    decision: 'accepted' | 'under moderation'
    moderator: string;
}