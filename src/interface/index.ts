export interface Instructor {
  name: string;
  email: string;
  officeHours: string;
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  department: string;
  university: string;
  credits: number;
  semester: string;
  instructor: Instructor;
  description: string;
  prerequisites: string[];
  learningOutcomes: string[];
}

export interface CourseRequest {
  course: Course;
}

export interface SimilarityScore {
  course: Course;
  similarity: number;
  matchedCriteria: string[];
}

export interface DatabaseRow {
  course_code: string;
  course_title: string;
  department: string;
  university: string;
  credits: number;
  semester: string;
  instructor_name: string;
  instructor_email: string;
  instructor_office_hours: string;
  description: string;
  prerequisites: string[] | null;
  learning_outcomes: string[] | null;
}

export interface PersonalizeRecommendationResponse {
  itemList?: Array<{
    itemId?: string;
  }>;
}

export interface RecommendationResponse {
  success: boolean;
  inputCourse: {
    courseCode: string;
    courseTitle: string;
    department: string;
  };
  recommendations: Course[];
  totalFound: number;
  recommendationMethod: 'personalize' | 'content-based';
}