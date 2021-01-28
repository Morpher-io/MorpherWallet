import { Recovery_Type, sequelize } from '../models';

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
    }
];

async function main() {
    await sequelize.sync();
    await Recovery_Type.bulkCreate(recoveryTypes);
    console.log('Database seeded successfully.');
}

main();
