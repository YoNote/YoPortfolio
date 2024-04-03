#include <iostream>
#include "EventSelectServer.h"

int main()
{
	std::cout << "Started EventSelect Server." << std::endl;

	EventSelectSocket eventSelSock;
	if (eventSelSock.StartedEventSelect(8080) != EventSelectSocketError::EVEENT_SELECT_SUCCESS)
	{
		std::cout << "FAILED ERROR : StartedEventSelect()" << std::endl;
		return -1;
	}

	std::cout << "WaitForMultipleEvents..." << std::endl;
	while (1)
	{
		if (!eventSelSock.AriseFromMultipleEvents())
		{
			std::cout << "AriseFromMultipleEvents() ERROR : Stop Server" << std::endl;
			break;
		}
	}

	return 0;
}