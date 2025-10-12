import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
    userRoles?: string[],
  ): Promise<PaginatedResponseDto<Employee>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.employeesRepository
      .createQueryBuilder('employee');
    
    // SUPERADMIN can see all employees across all organizations
    const isSuperAdmin = userRoles?.includes('SUPERADMIN');
    if (!isSuperAdmin) {
      queryBuilder.where('employee.organizationId = :organizationId', { organizationId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.email ILIKE :search OR employee.employeeId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`employee.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('employee.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .leftJoinAndSelect('employee.user', 'user')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['user', 'organization'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string, organizationId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.softDelete(id);
  }

  async getEmployeesByDepartment(organizationId: string, department: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { organizationId, department },
    });
  }

  async getEmployeeStats(organizationId: string) {
    const totalEmployees = await this.employeesRepository.count({
      where: { organizationId },
    });

    const activeEmployees = await this.employeesRepository.count({
      where: { organizationId, status: 'ACTIVE' as any },
    });

    const departments = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .where('employee.organizationId = :organizationId', { organizationId })
      .groupBy('employee.department')
      .getRawMany();

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      departments,
    };
  }

  async seedEmployees(organizationId: string) {
    const seedData = [
      {"EmployeeID":"EMP-001","FirstName":"Bill","LastName":"Essien","Email":"bill.essien@tribecore.com","PhoneNumber":"+44 7712 111111","Department":"Executive","JobTitle":"Chief Executive Officer","HireDate":"2021-01-15","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":null,"Currency":"GBP"},
      {"EmployeeID":"EMP-002","FirstName":"Ene","LastName":"Cathy","Email":"ene.cathy@tribecore.com","PhoneNumber":"+44 7712 111112","Department":"Operations","JobTitle":"Group COO","HireDate":"2021-03-01","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":150000,"Currency":"GBP"},
      {"EmployeeID":"EMP-003","FirstName":"Grace","LastName":"Akinola","Email":"grace.akinola@tribecore.com","PhoneNumber":"+44 7712 111113","Department":"Finance","JobTitle":"Group CFO","HireDate":"2021-06-20","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":145000,"Currency":"GBP"},
      {"EmployeeID":"EMP-004","FirstName":"Oluseun","LastName":"Oladiipo","Email":"oluseun.oladiipo@tribecore.com","PhoneNumber":"+44 7712 111114","Department":"Technology","JobTitle":"Group VP of Technology","HireDate":"2021-08-10","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":150000,"Currency":"GBP"},
      {"EmployeeID":"EMP-005","FirstName":"Matthew","LastName":"Odedoyin","Email":"matthew.odedoyin@tribecore.com","PhoneNumber":"+44 7712 111115","Department":"Development","JobTitle":"Director of Development","HireDate":"2022-02-01","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":115000,"Currency":"GBP"},
      {"EmployeeID":"EMP-006","FirstName":"Oludare","LastName":"Aduramimo","Email":"oludare.aduramimo@tribecore.com","PhoneNumber":"+44 7712 111116","Department":"Development","JobTitle":"Deputy Director of Development","HireDate":"2022-05-01","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":100000,"Currency":"GBP"},
      {"EmployeeID":"EMP-007","FirstName":"Jamie","LastName":"Lee","Email":"jamie.lee@tribecore.com","PhoneNumber":"+44 7712 111117","Department":"Engineering","JobTitle":"Senior Software Engineer (Backend)","HireDate":"2023-01-15","EmploymentType":"Full Time","Status":"Active","WorkLocation":"Remote - UK","BaseSalary":85000,"Currency":"GBP"},
      {"EmployeeID":"EMP-008","FirstName":"Adenike","LastName":"Akinola","Email":"reese.taylor@tribecore.io","PhoneNumber":"+44 7712 111118","Department":"Engineering","JobTitle":"Senior Software Engineer (Frontend)","HireDate":"2023-02-10","EmploymentType":"Full Time","Status":"Active","WorkLocation":"Remote - UK","BaseSalary":83000,"Currency":"GBP"},
      {"EmployeeID":"EMP-009","FirstName":"Avery","LastName":"Patel","Email":"avery.patel@tribecore.io","PhoneNumber":"+44 7712 111119","Department":"Data Science","JobTitle":"Data Scientist","HireDate":"2023-03-25","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":90000,"Currency":"GBP"},
      {"EmployeeID":"EMP-010","FirstName":"Adenike","LastName":"Williams","Email":"adenike.williams@tribecore.com","PhoneNumber":"+44 7712 111120","Department":"Strategy & Growth","JobTitle":"Strategic Growth Business Analyst","HireDate":"2023-04-01","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":110000,"Currency":"GBP"},
      {"EmployeeID":"EMP-011","FirstName":"Parker","LastName":"Morgan","Email":"parker.morgan@tribecore.com","PhoneNumber":"+44 7712 111121","Department":"People","JobTitle":"HR Manager","HireDate":"2022-09-05","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":65000,"Currency":"GBP"},
      {"EmployeeID":"EMP-012","FirstName":"Quinn","LastName":"Hayes","Email":"quinn.hayes@tribecore.com","PhoneNumber":"+44 7712 111122","Department":"Finance","JobTitle":"Accountant","HireDate":"2022-11-01","EmploymentType":"Full Time","Status":"Active","WorkLocation":"UK","BaseSalary":60000,"Currency":"GBP"}
    ];

    const results: Array<{ action: string; employee: Employee }> = [];
    for (const data of seedData) {
      // Check if employee exists
      const existing = await this.employeesRepository.findOne({
        where: { employeeId: data.EmployeeID }
      });

      const employeeData = {
        employeeId: data.EmployeeID,
        firstName: data.FirstName,
        lastName: data.LastName,
        email: data.Email,
        phoneNumber: data.PhoneNumber,
        department: data.Department,
        jobTitle: data.JobTitle,
        hireDate: new Date(data.HireDate),
        employmentType: data.EmploymentType.replace(' ', '_').toUpperCase() as any,
        status: data.Status.toUpperCase() as any,
        workLocation: data.WorkLocation as any,
        baseSalary: data.BaseSalary || 0,
        salaryCurrency: data.Currency,
        organizationId,
      };

      if (existing) {
        // Update existing
        Object.assign(existing, employeeData);
        const updated = await this.employeesRepository.save(existing);
        results.push({ action: 'updated', employee: updated });
      } else {
        // Create new
        const employee = this.employeesRepository.create(employeeData);
        const created = await this.employeesRepository.save(employee);
        results.push({ action: 'created', employee: created });
      }
    }

    return {
      message: `Seeded ${results.length} employees`,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      results,
    };
  }
}
