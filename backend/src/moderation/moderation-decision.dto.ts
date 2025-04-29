export class ModerationDecisionDto {
    decision: 'accepted' | 'rejected'
    moderator: string;
}