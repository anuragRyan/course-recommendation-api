import { Course, SimilarityScore } from '../interfaces';

export class ContentBasedRecommendation {
  static calculateSimilarity(targetCourse: Course, candidateCourse: Course): number {
    let score = 0;
    const weights = {
      department: 0.3,
      credits: 0.1,
      description: 0.4,
      prerequisites: 0.1,
      learningOutcomes: 0.1,
    };

    // Department similarity
    if (targetCourse.department === candidateCourse.department) {
      score += weights.department;
    }

    // Credits similarity (exact match or ±1 credit)
    const creditDiff = Math.abs(targetCourse.credits - candidateCourse.credits);
    if (creditDiff === 0) {
      score += weights.credits;
    } else if (creditDiff === 1) {
      score += weights.credits * 0.5;
    }

    // Description similarity (simple keyword matching)
    score += this.textSimilarity(
      targetCourse.description,
      candidateCourse.description
    ) * weights.description;

    // Prerequisites similarity
    score += this.arraySimilarity(
      targetCourse.prerequisites,
      candidateCourse.prerequisites
    ) * weights.prerequisites;

    // Learning outcomes similarity
    score += this.arraySimilarity(
      targetCourse.learningOutcomes,
      candidateCourse.learningOutcomes
    ) * weights.learningOutcomes;

    return score;
  }

  static generateRecommendations(
    targetCourse: Course, 
    allCourses: Course[], 
    limit: number = 10
  ): Course[] {
    // Filter out the target course itself
    const candidateCourses = allCourses.filter(
      c => c.courseCode !== targetCourse.courseCode
    );

    // Calculate similarity scores
    const similarityScores: SimilarityScore[] = candidateCourses.map(candidateCourse => {
      const similarity = this.calculateSimilarity(targetCourse, candidateCourse);
      const matchedCriteria = this.getMatchedCriteria(targetCourse, candidateCourse);
      
      return {
        course: candidateCourse,
        similarity,
        matchedCriteria,
      };
    });

    // Sort by similarity and return top results
    return similarityScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.course);
  }

  private static textSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private static arraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = [...set1].filter(item => set2.has(item));
    const union = [...new Set([...set1, ...set2])];
    
    return intersection.length / union.length;
  }

  private static getMatchedCriteria(targetCourse: Course, candidateCourse: Course): string[] {
    const criteria: string[] = [];
    
    if (targetCourse.department === candidateCourse.department) {
      criteria.push('Same Department');
    }
    
    if (Math.abs(targetCourse.credits - candidateCourse.credits) <= 1) {
      criteria.push('Similar Credits');
    }
    
    // Check for common keywords in description
    const targetWords = targetCourse.description.toLowerCase().split(/\W+/);
    const candidateWords = candidateCourse.description.toLowerCase().split(/\W+/);
    const commonWords = targetWords.filter(word => 
      word.length > 4 && candidateWords.includes(word)
    );
    
    if (commonWords.length > 2) {
      criteria.push('Similar Content');
    }
    
    return criteria;
  }
}