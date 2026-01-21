import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import {
  StartSimulationDto,
  SimulateOffRouteDto,
  SimulateCustomRouteDto,
  SimulateThrottledRerouteDto,
} from './dto/start-simulation.dto';

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
  @ApiOperation({ summary: 'Start standard simulation with normal route' })
  @ApiResponse({ status: 200, description: 'Simulation started' })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async startSimulation(
    @Param('jobId') jobId: string,
    @Body() dto: StartSimulationDto,
  ) {
    return this.simulationService.startSimulation(jobId, dto);
  }

  @Post('off-route/:jobId')
  @ApiOperation({
    summary: 'Simulate off-route scenario',
    description:
      'Driver deviates from route at specified point. Tests off-route detection.',
  })
  @ApiResponse({ status: 200, description: 'Off-route simulation started' })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async simulateOffRoute(
    @Param('jobId') jobId: string,
    @Body() dto: SimulateOffRouteDto,
  ) {
    return this.simulationService.simulateOffRoute(jobId, dto);
  }

  @Post('custom-route/:jobId')
  @ApiOperation({
    summary: 'Simulate with custom route coordinates',
    description: 'Define custom waypoints for the simulation.',
  })
  @ApiResponse({ status: 200, description: 'Custom route simulation started' })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async simulateCustomRoute(
    @Param('jobId') jobId: string,
    @Body() dto: SimulateCustomRouteDto,
  ) {
    return this.simulationService.simulateCustomRoute(jobId, dto);
  }

  @Post('throttled-reroute/:jobId')
  @ApiOperation({
    summary: 'Simulate throttled rerouting',
    description:
      'Tests throttling mechanism. Driver goes off-route, reroute triggered after delay.',
  })
  @ApiResponse({
    status: 200,
    description: 'Throttled reroute simulation started',
  })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async simulateThrottledReroute(
    @Param('jobId') jobId: string,
    @Body() dto: SimulateThrottledRerouteDto,
  ) {
    return this.simulationService.simulateThrottledReroute(jobId, dto);
  }

  @Delete('stop/:jobId')
  @ApiOperation({ summary: 'Stop an active simulation' })
  @ApiResponse({ status: 200, description: 'Simulation stopped' })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async stopSimulation(@Param('jobId') jobId: string) {
    return this.simulationService.stopSimulation(jobId);
  }

  @Get('active')
  @ApiOperation({ summary: 'List all active simulations' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of active simulation job IDs',
  })
  async getActiveSimulations() {
    return this.simulationService.getActiveSimulations();
  }
}
