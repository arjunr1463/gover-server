const candidates = require("../models/candidates");
const users = require("../models/users");
const categorySchema = require("../models/category");

const createCandidate = async (req, res) => {
  const { name, category, type, phoneNumber, email } = req.body;
  const imagefile = req.file;

  try {
    // Check if the candidate already exists
    const candidate = await candidates.findOne({ name, email }).exec();
    if (candidate) {
      return res.status(400).json({
        status: false,
        message: "Candidate already registered",
      });
    }

    // Create a new candidate
    const newCandidate = new candidates({
      name,
      category,
      type,
      image: imagefile?.path,
      phoneNumber,
      email,
      voteCount: 0,
    });

    // Save the new candidate and update the category concurrently
    const [candidateData] = await Promise.all([
      newCandidate.save(),
      categorySchema
        .findByIdAndUpdate(
          category,
          { $push: { candidates: newCandidate._id } },
          { new: true }
        )
        .exec(),
    ]);

    return res.status(200).json(candidateData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while creating the candidate",
    });
  }
};

const deleteCandidate = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json("email is required");
  }

  const candidateData = await candidates.findOneAndDelete({ email });
  if (candidateData) {
    return res.status(200).json(`${candidateData?.name} candidate deleted`);
  } else {
    return res.status(400).json("candidate not found");
  }
};

const getCandidate = async (req, res) => {
  const { category, type } = req.query;
  if (category && type) {
    const findUser = await users.findById(userId);
    const findCategory = findUser?.vote?.find(
      (item) => item.categoryId === category
    );
    let votedCandidates = [];
    if (findCategory) {
      const candidateIds = [
        findCategory.mega,
        findCategory.micro,
        findCategory.macro,
      ].filter(Boolean);
      votedCandidates = await candidates.find({
        _id: { $in: candidateIds },
      });
    }

    const candidateList = await candidates.find({ category, type });
    if (candidateList) {
      return res.status(200).json({
        success: true,
        candidates: candidateList,
        votedCandidates: votedCandidates,
        category: findUser?.vote,
      });
    } else {
      return res.status(400).json("not found candidate");
    }
  }
};

const addVote = async (req, res) => {
  const { _id, categoryId, type } = req.body;

  if (!_id || !categoryId || !type) {
    return res.status(400).json("ID, categoryId, and type are required");
  }

  try {
    const [candidateData, user] = await Promise.all([
      candidates.findById(_id).lean(),
      users.findById(userId).lean(),
    ]);

    if (!candidateData) {
      return res.status(404).json("Candidate not found");
    }

    if (candidateData.type !== type) {
      return res.status(404).json("Candidate is not listed in this category");
    }

    let voteUpdated = false;

    if (user?.vote?.length) {
      const categoryVote = user.vote.find(
        (vote) => vote.categoryId === categoryId
      );

      if (categoryVote) {
        if (categoryVote[type] !== undefined) {
          return res.status(403).json({
            status: false,
            message: "Already voted",
          });
        }
        categoryVote[type] = candidateData._id;
        voteUpdated = true;
      }
    }

    if (!voteUpdated) {
      const newVote = {
        categoryId,
        [type]: candidateData._id,
      };
      user.vote.push(newVote);
    }

    await Promise.all([
      candidates.findByIdAndUpdate(_id, { $inc: { voteCount: 1 } }),
      users.findByIdAndUpdate(userId, { vote: user.vote }, { new: true }),
    ]);

    return res.status(200).json("Vote marked successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};

const getUser = async (req, res) => {
  try {
    const user = await users.findById(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};

const totalVotes = async (req, res) => {
  try {
    const votes = await candidates.find();
    const totalVoteCount = votes.reduce((acc, data) => acc + data.voteCount, 0);

    const formattedVoteCount = (totalVoteCount + 100)
      .toString()
      .padStart(7, "0");

    return res.status(200).json({
      success: true,
      data: formattedVoteCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  createCandidate,
  deleteCandidate,
  getCandidate,
  addVote,
  getUser,
  totalVotes,
};
