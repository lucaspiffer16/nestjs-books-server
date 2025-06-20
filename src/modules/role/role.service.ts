import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { I18nService } from 'nestjs-i18n';

import { InjectRepository } from '@nestjs/typeorm';
import { Admin, User } from 'src/domains/entities';
import { Repository } from 'typeorm';

import { IBaseResponse } from 'src/commons/interfaces/base-response';

import { ROLE_ENUM } from 'src/commons/enums/roles';

@Injectable()
export class RoleService {
  constructor(
    private readonly i18n: I18nService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  private readonly logger: Logger = new Logger(RoleService.name);

  async promoteToAdmin(userId: string): Promise<IBaseResponse> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException(
          this.i18n.translate('services.USER.NOT_FOUND'),
        );
      }

      if (!user.roles.includes(ROLE_ENUM.ADMIN)) {
        user.roles = [...user.roles, ROLE_ENUM.ADMIN];
        await this.userRepository.save(user);
      }

      const adminAlreadyExists = await this.adminRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!adminAlreadyExists) {
        const adminToCreate = this.adminRepository.create({ user });

        await this.adminRepository.save(adminToCreate);
      }

      return {
        message: this.i18n.translate(
          'services.USER.MESSAGES.PROMOTED_TO_ADMIN',
        ),
      };
    } catch (error) {
      this.logger.error((error as Error).message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        this.i18n.translate('services.USER.MESSAGES.PROMOTED_TO_ADMIN_FAILED'),
      );
    }
  }
}
