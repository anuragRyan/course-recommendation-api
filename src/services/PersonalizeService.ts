import * as AWS from 'aws-sdk';
import { personalizeRuntime, campaignArn } from '../config/aws';
import { Course } from '../interfaces';
import { DatabaseService } from './DatabaseService';

export class PersonalizeService {
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
  }

  async getRecommendations(courseCode: string, numResults: number = 10): Promise<Course[]> {
    try {
      if (!campaignArn) {
        throw new Error('Personalize campaign ARN not configured');
      }

      const params: AWS.PersonalizeRuntime.GetRecommendationsRequest = {
        campaignArn,
        itemId: courseCode,
        numResults,
      };

      const result: AWS.PersonalizeRuntime.GetRecommendationsResponse = 
        await personalizeRuntime.getRecommendations(params).promise();
      
      if (result.itemList && result.itemList.length > 0) {
        const itemIds: string[] = result.itemList
          .map(item => item.itemId)
          .filter((itemId): itemId is string => itemId !== undefined);
        
        return await this.databaseService.getCoursesByIds(itemIds);
      }
      
      return [];
    } catch (error) {
      console.error('Personalize recommendation error:', error);
      return [];
    }
  }
}