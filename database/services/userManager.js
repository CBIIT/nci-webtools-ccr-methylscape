export class UserManager {
  database = null;

  constructor(database) {
    this.database = database;
  }

  async getUsers() {
    return await this.database("user")
      .leftJoin("role", "user.roleId", "role.id")
      .leftJoin("organization", "user.organizationId", "organization.id")
      .select("user.*", "role.name as roleName", "organization.name as organizationName")
      .orderBy("user.id");
  }

  async getUsersByRoleName(roleName) {
    return await this.database("user")
      .leftJoin("role", "user.roleId", "role.id")
      .leftJoin("organization", "user.organizationId", "organization.id")
      .select("user.*", "role.name as roleName", "organization.name as organizationName")
      .where({ "role.name": roleName })
      .orderBy("user.id");
  }

  async getUsersByOrganizationName(organizationName) {
    return await this.database("user")
      .leftJoin("role", "user.roleId", "role.id")
      .leftJoin("organization", "user.organizationId", "organization.id")
      .select("user.*", "role.name as roleName", "organization.name as organizationName")
      .where("organization.name", organizationName)
      .orderBy("user.id");
  }

  async getUser(userId) {
    const user = await this.database("user")
      .leftJoin("role", "user.roleId", "role.id")
      .leftJoin("organization", "user.organizationId", "organization.id")
      .where({ "user.id": userId })
      .select("user.*", "role.name as roleName", "organization.name as organizationName")
      .first();

    if (user) user.rolePolicies = await this.getUserRolePolicies(user.id);

    return user;
  }

  async getUserByEmail(email) {
    const user = await this.database("user")
      .leftJoin("role", "user.roleId", "role.id")
      .leftJoin("organization", "user.organizationId", "organization.id")
      .where({ "user.email": email })
      .select("user.*", "role.name as roleName", "organization.name as organizationName")
      .first();

    if (user) user.rolePolicies = await this.getUserRolePolicies(user.id);

    return user;
  }

  async addUser(user) {
    const userExists = await this.database("user").where({ name: user.name });
    if (userExists && userExists.length > 0) {
      throw new Error("User already exists");
    } else {
      const columnInfo = await this.database("user").columnInfo();
      for (let key in user) {
        if (!columnInfo[key]) {
          delete user[key];
        }
      }
      const [newUser] = await this.database("user").insert(user).returning("id");
      return await this.getUser(newUser.id);
    }
  }

  async updateUser(user) {
    const columnInfo = await this.database("user").columnInfo();
    for (let key in user) {
      if (!columnInfo[key]) {
        delete user[key];
      }
    }
    await this.database("user").where({ id: user.id }).update(user);
    return await this.getUser(user.id);
  }

  async removeUser(userId) {
    return await this.database("user").where({ id: userId }).delete();
  }

  async getUserRolePolicies(userId) {
    return await this.database("user")
      .innerJoin("role", "user.roleId", "role.id")
      .innerJoin("rolePolicy", "role.id", "rolePolicy.roleId")
      .select("rolePolicy.*")
      .where({ "user.id": userId });
  }
}
