import userModel from "../models/user.model.js";

const plans = {
  free: 1 * 1024 * 1024 * 1024, // 1GB
  pro: 10 * 1024 * 1024 * 1024, // 10GB
  premium: 100 * 1024 * 1024 * 1024, // 100GB
};

export const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    if (!plan || !plans[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const storageLimit = plans[plan];

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        plan,
        storageLimit,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: `Plan upgraded to ${plan} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Upgrade Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while upgrading the plan",
    });
  }
};

export const getPlanInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select("plan storageLimit storageUsed");
        return res.status(200).json({
            success: true,
            data: {
                plan: user.plan,
                storageLimit: user.storageLimit,
                storageUsed: user.storageUsed,
                remainingStorage: user.storageLimit - user.storageUsed
            }
        });
    } catch (error) {
        console.error("Get Plan Info Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching plan info",
        });
    }
}
