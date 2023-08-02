import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

// mock tasks repo
const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findById: jest.fn(),
});

const mockUser = {
  username: 'Aria',
  id: 'someid',
  password: 'pass',
  tasks: [],
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    // init nest js module with service and repo
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      expect(tasksRepository.getTasks).not.toHaveBeenCalled();
      // promise use mock resolved value
      // non promise use value
      tasksRepository.getTasks.mockResolvedValue('someValue');
      // call get tasks, which should then call the repo's get tasks
      const result = await tasksService.getTasks(null, mockUser);
      expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      const mockTask = {
        title: 'Test title',
        description: 'desc',
        id: 'someid',
        status: TaskStatus.OPEN,
      };

      tasksRepository.findById.mockResolvedValue(mockTask);
      // call get tasks, which should then call the repo's get tasks
      const result = await tasksService.getTaskById('someid', mockUser);
      expect(tasksRepository.findById).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOne and handles the error', async () => {
      tasksRepository.findById.mockResolvedValue(null);
      await expect(
        tasksService.getTaskById('someId', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
