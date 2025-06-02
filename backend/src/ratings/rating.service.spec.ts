describe('RatingService (minimal unit test)', () => {

  it('should create a new rating (when none exists) and update article sums', async () => {
        // arrange
        //   article with ratingSum = oldSum and ratingCount = oldCount
        //   no existing rating for (articleId, userId)
        //
        // act
        //   call createOrUpdateRating(userId, { articleId, value })
        //
        // assert
        //   check new rating was created with the right value
        //   check article.ratingSum went from oldSum to oldSum + value
        //   check article.ratingCount went from oldCount to oldCount + 1
        //   check averageRating is (oldSum + value) / (oldCount + 1)
  });

  it('should throw NotFoundException if the article does not exist', async () => {
    // arrange
    //   pretend there’s no article for that articleId
    //
    // act & assert
    //   calling createOrUpdateRating(userId, { articleId, value }) should throw notFoundException

  });
});