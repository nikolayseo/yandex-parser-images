const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:12345@localhost:3306/my_database');

class Images extends Sequelize.Model {
}

Images.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    image_url: {
        type: Sequelize.TEXT
    },
    date_created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    sequelize,
    modelName: 'images',
    timestamps: false
});

Images.sync({force: false}).then(() => {
    console.log('synchronizing tables');
});

module.exports = Images;
