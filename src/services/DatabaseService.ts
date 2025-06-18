import { QueryResult } from 'pg';
import { pool } from '../config/database';
import { Course, DatabaseRow } from '../interfaces';

export class DatabaseService {
  async getAllCourses(): Promise<Course[]> {
    try {
      const query = `
        SELECT 
          course_code,
          course_title,
          department,
          university,
          credits,
          semester,
          instructor_name,
          instructor_email,
          instructor_office_hours,
          description,
          prerequisites,
          learning_outcomes
        FROM courses
      `;
      
      const result: QueryResult<DatabaseRow> = await pool.query(query);
      return result.rows.map(row => this.mapRowToCourse(row));
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch courses from database');
    }
  }

  async getCourseByCode(courseCode: string): Promise<Course | null> {
    try {
      const query = `
        SELECT 
          course_code,
          course_title,
          department,
          university,
          credits,
          semester,
          instructor_name,
          instructor_email,
          instructor_office_hours,
          description,
          prerequisites,
          learning_outcomes
        FROM courses 
        WHERE course_code = $1
      `;
      
      const result: QueryResult<DatabaseRow> = await pool.query(query, [courseCode]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToCourse(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  async getCoursesByIds(courseIds: string[]): Promise<Course[]> {
    if (courseIds.length === 0) return [];
    
    try {
      const placeholders = courseIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `SELECT * FROM courses WHERE course_code IN (${placeholders})`;
      
      const result: QueryResult<DatabaseRow> = await pool.query(query, courseIds);
      return result.rows.map(row => this.mapRowToCourse(row));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  private mapRowToCourse(row: DatabaseRow): Course {
    return {
      courseCode: row.course_code,
      courseTitle: row.course_title,
      department: row.department,
      university: row.university,
      credits: row.credits,
      semester: row.semester,
      instructor: {
        name: row.instructor_name,
        email: row.instructor_email,
        officeHours: row.instructor_office_hours,
      },
      description: row.description,
      prerequisites: row.prerequisites || [],
      learningOutcomes: row.learning_outcomes || [],
    };
  }
}