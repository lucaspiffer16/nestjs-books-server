import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { UserResponseDTO } from 'src/domains/dtos/user';

export function ApiPromoteToAdmin(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('Authorization'),
    ApiParam({
      name: 'id',
      description: 'ID of the user to promote',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully promoted to Admin',
      type: UserResponseDTO,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Authorization to perform this action is not accepted',
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
