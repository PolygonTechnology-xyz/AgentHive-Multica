import { Injectable } from '@nestjs/common';
import { BidderAgent } from './bidder-agent.entity';
import { Job } from '../jobs/job.entity';

export interface ScoringBreakdown {
  total: number;
  categoryMatch: number;
  skillsMatch: number;
  budgetFit: number;
  deadlineFeasibility: number;
}

@Injectable()
export class ScoringService {
  score(agent: BidderAgent, job: Job): ScoringBreakdown {
    const rules = agent.scoringRules ?? {};
    let categoryMatch = 0;
    let skillsMatch = 0;
    let budgetFit = 0;
    let deadlineFeasibility = 10;

    // Category: +40 if agent prefers this category
    if (rules.preferredCategories?.length && job.category) {
      const normalized = rules.preferredCategories.map((c) => c.toLowerCase());
      if (normalized.includes(job.category.toLowerCase())) {
        categoryMatch = 40;
      } else {
        categoryMatch = 5;
      }
    } else {
      categoryMatch = 20;
    }

    // Skills: +30 proportional to overlap
    if (rules.preferredSkills?.length && job.skillsRequired?.length) {
      const agentSkills = rules.preferredSkills.map((s) => s.toLowerCase());
      const jobSkills = job.skillsRequired.map((s) => s.toLowerCase());
      const overlap = agentSkills.filter((s) => jobSkills.includes(s)).length;
      skillsMatch = Math.round((overlap / jobSkills.length) * 30);
    } else if (!job.skillsRequired?.length) {
      skillsMatch = 15;
    } else {
      skillsMatch = 5;
    }

    // Budget: +20 if job budget in range
    const jobBudget = job.budgetMax ?? job.budgetMin;
    if (jobBudget) {
      const agentMin = rules.budgetMin ?? 0;
      const agentMax = rules.budgetMax ?? Infinity;
      if (jobBudget >= agentMin && jobBudget <= agentMax) {
        budgetFit = 20;
      } else if (jobBudget < agentMin) {
        budgetFit = 0;
      } else {
        budgetFit = 5;
      }
    } else {
      budgetFit = 10;
    }

    // Deadline: +10 if deadline > 3 days or no deadline
    if (job.deadline) {
      const daysLeft = (job.deadline.getTime() - Date.now()) / (1000 * 3600 * 24);
      deadlineFeasibility = daysLeft >= 3 ? 10 : daysLeft >= 1 ? 5 : 0;
    }

    const total = categoryMatch + skillsMatch + budgetFit + deadlineFeasibility;

    return { total, categoryMatch, skillsMatch, budgetFit, deadlineFeasibility };
  }

  parseNlConfig(nlConfig: string): BidderAgent['scoringRules'] {
    if (!nlConfig) return {};

    const lower = nlConfig.toLowerCase();
    const rules: BidderAgent['scoringRules'] = {};

    // Extract budget range: "between 100 and 500" or "up to 1000" or "at least 200"
    const betweenMatch = lower.match(/between\s+(\d+)\s+and\s+(\d+)/);
    const upToMatch = lower.match(/up\s+to\s+(\d+)/);
    const atLeastMatch = lower.match(/at\s+least\s+(\d+)/);

    if (betweenMatch) {
      rules.budgetMin = parseInt(betweenMatch[1]);
      rules.budgetMax = parseInt(betweenMatch[2]);
    } else if (upToMatch) {
      rules.budgetMax = parseInt(upToMatch[1]);
    } else if (atLeastMatch) {
      rules.budgetMin = parseInt(atLeastMatch[1]);
    }

    // Extract keywords for categories
    const categoryKeywords = [
      'web', 'mobile', 'design', 'writing', 'marketing', 'data', 'ai',
      'backend', 'frontend', 'fullstack', 'devops', 'security',
    ];
    rules.preferredCategories = categoryKeywords.filter((kw) => lower.includes(kw));

    // Extract skill keywords (simple: look for common tech terms)
    const skillKeywords = [
      'react', 'vue', 'angular', 'node', 'python', 'java', 'typescript',
      'javascript', 'django', 'fastapi', 'nestjs', 'nextjs', 'mysql',
      'postgres', 'mongodb', 'redis', 'aws', 'docker', 'kubernetes',
    ];
    rules.preferredSkills = skillKeywords.filter((kw) => lower.includes(kw));

    return rules;
  }
}
