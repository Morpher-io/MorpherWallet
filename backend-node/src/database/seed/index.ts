import { sequelize } from '../';

const recoveryTypes = [
    {
        id: 1,
        name: 'Password'
    },
    {
        id: 2,
        name: 'Facebook'
    },
    {
        id: 3,
        name: 'Google'
    },
    {
        id: 4,
        name: 'Twitter'
    },
    {
        id: 5,
        name: 'VKontakte'
    },
    {
        id: 6,
        name: 'Apple'
    }
];

async function main() {
    await sequelize.sync({ alter: true });
    await sequelize.models.Recovery_Type.bulkCreate(recoveryTypes);
    console.log('Database seeded successfully.');
}

main();

export { main };
