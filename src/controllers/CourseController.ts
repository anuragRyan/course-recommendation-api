import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { PersonalizeService } from '../services/PersonalizeService';
import { ContentBasedRecommendation } from '../services/ContentBasedRecommendation';
import { CourseRequest, Course, RecommendationResponse } from '../interfaces';

export class CourseController {
  private databaseService: DatabaseService;
  private personalizeService: PersonalizeService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.personalizeService = new PersonalizeService();
  }

  async recommendCourses(req: Request, res: Response): Promise<void> {
    try {
      const { course }: CourseRequest = req.body;
      
      if (!course || !course.courseCode) {
        res.status(400).json({
          error: 'Invalid request. Course object with courseCode is required.',
        });
        return;
      }

      // Step 1: Try Amazon Personalize recommendations
      let recommendations: Course[] = [];
      let recommendationMethod: 'personalize' | 'content-based' = 'personalize';
      
      try {
        recommendations = await this.personalizeService.getRecommendations(course.courseCode, 10);
      } catch (error) {
        console.log('Personalize not available, falling back to content-based filtering');
      }

      // Step 2: If Personalize doesn't return results, use content-based filtering
      if (recommendations.length === 0) {
        console.log('Using content-based filtering for recommendations');
        recommendationMethod = 'content-based';
        
        const allCourses = await this.databaseService.getAllCourses();
        recommendations = ContentBasedRecommendation.generateRecommendations(course, allCourses, 10);
      }

      // Apply additional filtering
      const filteredRecommendations = recommendations.filter(rec => {
        // Filter out courses from the same semester to avoid conflicts
        return rec.semester !== course.semester;
      });

      const response: RecommendationResponse = {
        success: true,
        inputCourse: {
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          department: course.department,
        },
        recommendations: filteredRecommendations.slice(0, 8),
        totalFound: filteredRecommendations.length,
        recommendationMethod,
      };

      res.json(response);

    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({
        error: 'Internal server error while generating recommendations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await this.databaseService.getAllCourses();
      res.json({
        success: true,
        courses: courses.slice(0, 20), // Return first 20 for testing
        total: courses.length,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch courses',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  async getCourseByCode(req: Request, res: Response): Promise<void> {
    try {
      const { courseCode } = req.params;
      const course = await this.databaseService.getCourseByCode(courseCode);
      
      if (!course) {
        res.status(404).json({
          error: 'Course not found',
        });
        return;
      }
      
      res.json({
        success: true,
        course,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch course',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  async healthCheck(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        personalize: process.env.PERSONALIZE_CAMPAIGN_ARN ? 'configured' : 'not configured',
      },
    });
  }
}