export const calculateGrade = (records, categories) => {
    let totalGrade = 0;

    categories.forEach(category => {
        const categoryPercentage = parseFloat(category.category2) / 100;
        const categoryRecords = records.filter(record => record.categoryId === category.categoryId);

        if (categoryRecords.length > 0) {
            const categoryScore = categoryRecords.reduce((acc, record) => {
                const scorePercentage = (parseFloat(record.score) / parseFloat(record.item)) * 100;
                return acc + scorePercentage;
            }, 0) / categoryRecords.length;

            const weightedScore = (categoryScore * categoryPercentage);
            totalGrade += weightedScore;
        }
    });

    return totalGrade;
};