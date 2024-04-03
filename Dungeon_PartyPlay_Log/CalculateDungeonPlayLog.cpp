/*
* 문제풀이 연습 코드
* 1) input.txt에는 플레이어의 던전 LOG가 기록되어 있다.
* 2) 각각 플레이어가 어떤 플레이어와 게임을 했는지 한눈에 보고 싶어한다.
*    출력 결과 예제) maha : morian(3) nevan(2) noah(3) pan(2)
*/

#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>

struct DungeonPlayInfo
{
	std::string account;
	int			dungeonID;
};

class CFileManager
{
private:
	std::string						m_filePath;

	std::map<int, std::vector<std::string>>				m_dungeonPlayLog;
	std::map<std::string, std::map<std::string, int>>		m_calcOutput;

public:
	CFileManager(std::string filePath)
		: m_filePath(filePath)
	{}

	bool LoadData()
	{
		std::ifstream openFile(m_filePath.data());
		if (openFile.is_open() == false) { return false; }

		std::string line;
		while (std::getline(openFile, line))
		{
			if (line.compare("* 0") > 0)
			{
				DungeonPlayInfo& tempInfo = this->Parsing(line);

				this->InsertDungeonLog(tempInfo);
			}
		}
		openFile.close();

		return true;
	}

	void CalcData()
	{
		for (auto &dungeonLog : m_dungeonPlayLog)
		{
			// 플레이어 분류 시작 : 순차적으로 유저리스트 확인
			for (auto &player : dungeonLog.second)
			{
				// 어떤 유저와 플레이 했는지 확인하여 카운트 증가.
				for (auto &targetPlayer : dungeonLog.second)
				{
					if (player.compare(targetPlayer) == 0) { continue; }

					auto targetInfo = m_calcOutput[player].find(targetPlayer);
					if (targetInfo != m_calcOutput[player].end())
					{
						targetInfo->second += 1;
					}
					else
					{
						m_calcOutput[player].emplace(targetPlayer, 1);
					}
				}
			}
		}
	}

	void PrintData()
	{
		for (auto &player : m_calcOutput)
		{
			std::cout << player.first << " : ";

			for (auto targetPlayer : player.second)
			{
				std::cout << targetPlayer.first << "(" << targetPlayer.second << ") ";
			}

			std::cout << std::endl;
		}
	}

	~CFileManager() {}

private:
	const char delim = ' ';

	DungeonPlayInfo& Parsing(std::string data)
	{
		size_t prePos = 0, curPos;
		curPos = data.find(delim);

		DungeonPlayInfo* item = new DungeonPlayInfo;
		while (curPos != std::string::npos)
		{
			item->account = data.substr(prePos, (curPos - prePos));

			prePos = curPos + 1;
			curPos = data.find(' ', prePos);
		}

		std::string subString = data.substr(prePos, (curPos - prePos));
		item->dungeonID = stoi(subString);

		return *item;
	}

	void InsertDungeonLog(DungeonPlayInfo& playInfo)
	{
		bool isFindUser = false;
		if (m_dungeonPlayLog.find(playInfo.dungeonID) != m_dungeonPlayLog.end())
		{
			for (auto item : m_dungeonPlayLog[playInfo.dungeonID])
			{
				if (playInfo.account.compare(item) != 0) { continue; }

				isFindUser = true;
				break;
			}
		}

		if (isFindUser == false)
		{
			m_dungeonPlayLog[playInfo.dungeonID].push_back(playInfo.account);
		}
	}
};


int main()
{
	CFileManager fileManager("INPUT.TXT") ;

	fileManager.LoadData();

	fileManager.CalcData();

	fileManager.PrintData();

	return 0;
}	
