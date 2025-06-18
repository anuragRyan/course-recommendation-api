import { Course } from '../interfaces';

export function getMatchedCriteria(targetCourse: Course, candidateCourse: Course): string[] {
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

export function validateCourseData(course: any): boolean {
  return course && 
         typeof course.courseCode === 'string' &&
         typeof course.courseTitle === 'string' &&
         typeof course.department === 'string' &&
         typeof course.description === 'string';
}