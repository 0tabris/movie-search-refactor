import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class MovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imdbID: string;

  @IsNumber()
  @Min(0)
  year: number;

  @IsString()
  poster: string;
}
