import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { StartSimulationDto } from './dto/start-simulation.dto';

@ApiTags('Simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('create-job')
  @ApiOperation({ summary: 'Create a simulation job with dummy data' })
  @ApiResponse({
    status: 201,
    description: 'Simulation job created successfully',
  })
  async createSimulationJob() {
    return this.simulationService.createSimulationJob();
  }

  @Post('start/:jobId')
  @ApiOperation({ summary: 'Start a simulation job and push location updates' })
  @ApiResponse({
    status: 200,
    description: 'Simulation started successfully',
  })
  async startSimulation(
    @Param('jobId') jobId: string,
    @Body() dto: StartSimulationDto,
  ) {
    return this.simulationService.startSimulation(jobId, dto);
  }
}
