const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notice', {
    no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "제목"
    },
    writer: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "작성자"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "내용"
    },
    regdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "작성일자"
    },
    fixed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "상단고정"
    }
  }, {
    sequelize,
    tableName: 'notice',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "no" },
        ]
      },
    ]
  });
};
