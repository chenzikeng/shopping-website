#!/bin/bash
# 阿里云ECS安全组开放3000端口脚本

# 请替换以下变量为您的实际值
REGION="cn-hangzhou"           # 您的ECS所在地域
SECURITY_GROUP_ID="sg-xxxxxxx" # 您的安全组ID

# 添加3000端口入方向规则
aliyun ecs AuthorizeSecurityGroup \
  --RegionId $REGION \
  --SecurityGroupId $SECURITY_GROUP_ID \
  --IpProtocol tcp \
  --PortRange 3000/3000 \
  --SourceCidrIp 0.0.0.0/0 \
  --Priority 1

echo "3000端口已成功添加到安全组！"